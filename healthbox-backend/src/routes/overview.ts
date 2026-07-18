import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest, requireRole } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";

export const overviewRouter: Router = Router();

overviewRouter.get(
  "/overview/field-worker",
  authMiddleware,
  requireRole(["field_worker", "team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId }
      });

      if (user === null) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const allCases = await prisma.malariaCase.findMany({
        where: { healthWorkerId: req.userId }
      });

      const total = allCases.length;
      const draft = allCases.filter(c => c.status === "draft").length;
      const submitted = allCases.filter(c => c.status === "submitted").length;
      const rdtPositive = allCases.filter(c => c.rdtResult === "positive").length;
      const rdtNegative = allCases.filter(c => c.rdtResult === "negative").length;
      const microscopyPositive = allCases.filter(c => c.microscopyResult === "positive").length;
      const microscopyNegative = allCases.filter(c => c.microscopyResult === "negative").length;

      const recentCases = await prisma.malariaCase.findMany({
        where: { healthWorkerId: req.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          patientFullName: true,
          visitDate: true,
          rdtResult: true,
          microscopyResult: true,
          status: true
        }
      });

      res.json({
        total,
        byStatus: { draft, submitted },
        byResult: {
          rdt: { positive: rdtPositive, negative: rdtNegative },
          microscopy: { positive: microscopyPositive, negative: microscopyNegative }
        },
        recentCases
      });
    } catch (error) {
      console.error("Field worker overview error:", error);
      res.status(500).json({ error: "Failed to get overview" });
    }
  }
);

overviewRouter.get(
  "/overview/team-leader",
  authMiddleware,
  requireRole(["team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const team = await prisma.team.findUnique({
        where: { teamLeaderId: req.userId },
        include: {
          teamLeader: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          }
        }
      });

      if (team === null) {
        res.json({ hasTeam: false });
        return;
      }

      const members = await prisma.user.findMany({
        where: {
          teamId: team.id,
          role: "field_worker"
        },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true
        }
      });

      const allMemberIds = [req.userId, ...members.map(m => m.id)];

      const allCases = await prisma.malariaCase.findMany({
        where: { healthWorkerId: { in: allMemberIds } }
      });

      const total = allCases.length;
      const rdtPositive = allCases.filter(c => c.rdtResult === "positive").length;
      const rdtNegative = allCases.filter(c => c.rdtResult === "negative").length;

      const recentCases = await prisma.malariaCase.findMany({
        where: { healthWorkerId: { in: allMemberIds } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          patientFullName: true,
          visitDate: true,
          rdtResult: true,
          microscopyResult: true,
          status: true,
          healthWorkerId: true
        }
      });

      const caseCounts = await prisma.malariaCase.groupBy({
        by: ["healthWorkerId"],
        where: {
          healthWorkerId: { in: allMemberIds }
        },
        _count: {
          _all: true
        }
      });

      const caseCountMap = new Map(caseCounts.map(c => [c.healthWorkerId, c._count._all ?? 0]));

      const perMemberComparison = allMemberIds.map(id => {
        const memberUser = members.find(m => m.id === id);
        return {
          fullName: memberUser?.fullName ?? team.teamLeader.fullName,
          caseCount: caseCountMap.get(id) ?? 0
        };
      });

      res.json({
        hasTeam: true,
        personalStats: {
          total: allCases.filter(c => c.healthWorkerId === req.userId).length,
          byStatus: {
            draft: allCases.filter(c => c.healthWorkerId === req.userId && c.status === "draft").length,
            submitted: allCases.filter(c => c.healthWorkerId === req.userId && c.status === "submitted").length
          },
          byResult: {
            rdt: {
              positive: allCases.filter(c => c.healthWorkerId === req.userId && c.rdtResult === "positive").length,
              negative: allCases.filter(c => c.healthWorkerId === req.userId && c.rdtResult === "negative").length
            },
            microscopy: {
              positive: allCases.filter(c => c.healthWorkerId === req.userId && c.microscopyResult === "positive").length,
              negative: allCases.filter(c => c.healthWorkerId === req.userId && c.microscopyResult === "negative").length
            }
          },
          recentCases: recentCases.filter(c => c.healthWorkerId === req.userId)
        },
        team: {
          id: team.id,
          name: team.name,
          facility: team.facility,
          teamLeader: team.teamLeader,
          memberCount: members.length
        },
        members: members.map(m => ({
          id: m.id,
          fullName: m.fullName,
          phoneNumber: m.phoneNumber,
          caseCount: caseCountMap.get(m.id) ?? 0
        })),
        teamTotals: {
          totalCases: total,
          rdtPositive,
          rdtNegative
        },
        perMemberComparison
      });
    } catch (error) {
      console.error("Team leader overview error:", error);
      res.status(500).json({ error: "Failed to get overview" });
    }
  }
);

overviewRouter.get(
  "/overview/supervisor",
  authMiddleware,
  requireRole(["supervisor"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userFacility === undefined || req.userFacility === null) {
      res.status(400).json({ error: "User facility not found" });
      return;
    }

    try {
      const teams = await prisma.team.findMany({
        where: { facility: req.userFacility },
        include: {
          teamLeader: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      const teamStats = await Promise.all(teams.map(async team => {
        const members = await prisma.user.findMany({
          where: {
            teamId: team.id,
            role: "field_worker"
          },
          select: { id: true }
        });

        const allMemberIds = [team.teamLeaderId, ...members.map(m => m.id)];

        const cases = await prisma.malariaCase.findMany({
          where: { healthWorkerId: { in: allMemberIds } }
        });

        return {
          id: team.id,
          name: team.name,
          teamLeaderName: team.teamLeader.fullName,
          memberCount: members.length,
          totalCases: cases.length,
          rdtPositive: cases.filter(c => c.rdtResult === "positive").length,
          rdtNegative: cases.filter(c => c.rdtResult === "negative").length,
          allMemberIds
        };
      }));

      const allTeamMemberIds = teamStats.flatMap(t => t.allMemberIds).filter((v, i, a) => a.indexOf(v) === i);
      const allCases = await prisma.malariaCase.findMany({
        where: {
          healthWorkerId: { in: allTeamMemberIds }
        }
      });

      res.json({
        facility: req.userFacility,
        teams: teamStats.map(t => ({
          id: t.id,
          name: t.name,
          teamLeaderName: t.teamLeaderName,
          memberCount: t.memberCount,
          totalCases: t.totalCases,
          rdtPositive: t.rdtPositive,
          rdtNegative: t.rdtNegative
        })),
        facilityTotals: {
          totalTeams: teams.length,
          totalCases: allCases.length,
          rdtPositive: allCases.filter(c => c.rdtResult === "positive").length,
          rdtNegative: allCases.filter(c => c.rdtResult === "negative").length
        }
      });
    } catch (error) {
      console.error("Supervisor overview error:", error);
      res.status(500).json({ error: "Failed to get overview" });
    }
  }
);