import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest, requireRole } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";

export const teamsRouter: Router = Router();

interface CreateTeamBody {
  name: string;
}

interface AddMemberBody {
  userId: string;
}

teamsRouter.post(
  "/teams",
  authMiddleware,
  requireRole(["team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const existingTeam = await prisma.team.findUnique({
        where: { teamLeaderId: req.userId }
      });

      if (existingTeam !== null) {
        res.status(409).json({ error: "Team leader already leads a team" });
        return;
      }

      const body = req.body as CreateTeamBody;

      if (body.name === undefined || body.name === null || body.name === "") {
        res.status(400).json({ error: "Team name is required" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId }
      });

      if (user === null) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const team = await prisma.team.create({
        data: {
          name: body.name,
          teamLeaderId: req.userId,
          facility: user.facility
        }
      });

      await prisma.user.update({
        where: { id: req.userId },
        data: { teamId: team.id }
      });

      res.status(201).json({
        team: {
          id: team.id,
          name: team.name,
          facility: team.facility
        }
      });
    } catch (error) {
      console.error("Create team error:", error);
      res.status(500).json({ error: "Failed to create team" });
    }
  }
);

teamsRouter.get(
  "/teams/search",
  authMiddleware,
  requireRole(["team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const phone = req.query.phone as string | undefined;

    if (phone === undefined || phone === null || phone === "") {
      res.status(400).json({ error: "Phone query parameter is required" });
      return;
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          phoneNumber: phone,
          role: "field_worker",
          teamId: null
        },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true
        }
      });

      if (user === null) {
        res.json({ user: null });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error("Search user error:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  }
);

teamsRouter.post(
  "/teams/:teamId/members",
  authMiddleware,
  requireRole(["team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const teamId = req.params.teamId;
    const body = req.body as AddMemberBody;

    if (body.userId === undefined || body.userId === null || body.userId === "") {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });

      if (team === null) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      if (team.teamLeaderId !== req.userId) {
        res.status(403).json({ error: "Only the team leader can add members" });
        return;
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: body.userId }
      });

      if (targetUser === null) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (targetUser.role !== "field_worker") {
        res.status(400).json({ error: "User must be a field worker" });
        return;
      }

      if (targetUser.teamId !== null) {
        res.status(409).json({ error: "User is already on a team" });
        return;
      }

      await prisma.user.update({
        where: { id: body.userId },
        data: { teamId: teamId }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Add member error:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  }
);

teamsRouter.delete(
  "/teams/:teamId/members/:userId",
  authMiddleware,
  requireRole(["team_leader"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const teamId = req.params.teamId;
    const targetUserId = req.params.userId;

    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });

      if (team === null) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      if (team.teamLeaderId !== req.userId) {
        res.status(403).json({ error: "Only the team leader can remove members" });
        return;
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (targetUser === null) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (targetUser.teamId !== teamId) {
        res.status(400).json({ error: "User is not a member of this team" });
        return;
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { teamId: null }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  }
);

teamsRouter.get(
  "/teams/my-team",
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
        res.status(404).json({ error: "No team found for this leader" });
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

      const memberIds = members.map(m => m.id);
      const caseCounts = await prisma.malariaCase.groupBy({
        by: ["healthWorkerId"],
        where: {
          healthWorkerId: { in: memberIds }
        },
        _count: {
          _all: true
        }
      });

      const caseCountMap = new Map(caseCounts.map(c => [c.healthWorkerId, c._count._all as number]));

      res.json({
        team: {
          id: team.id,
          name: team.name,
          facility: team.facility,
          teamLeader: team.teamLeader
        },
        members: members.map(m => ({
          id: m.id,
          fullName: m.fullName,
          phoneNumber: m.phoneNumber,
          caseCount: caseCountMap.get(m.id) ?? 0
        }))
      });
    } catch (error) {
      console.error("Get my team error:", error);
      res.status(500).json({ error: "Failed to get team" });
    }
  }
);