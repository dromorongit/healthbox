import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";

export const adminCasesRouter: Router = Router();

adminCasesRouter.use(adminAuthMiddleware);

interface CasesQuery {
  facility?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: string;
  limit?: string;
}

adminCasesRouter.get("/cases", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as CasesQuery;
    const page = query.page !== undefined && query.page !== null ? parseInt(query.page, 10) : 1;
    const limit = query.limit !== undefined && query.limit !== null ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: {
      facilityName?: string;
      status?: string;
      createdAt?: { gte?: Date; lte?: Date };
      patientFullName?: { contains: string; mode: "insensitive" };
    } = {};

    if (query.facility !== undefined && query.facility !== null && query.facility !== "") {
      where.facilityName = query.facility;
    }
    if (query.status !== undefined && query.status !== null && query.status !== "") {
      where.status = query.status;
    }
    if (query.dateFrom !== undefined && query.dateFrom !== null && query.dateFrom !== "") {
      where.createdAt = { ...where.createdAt, gte: new Date(query.dateFrom) };
    }
    if (query.dateTo !== undefined && query.dateTo !== null && query.dateTo !== "") {
      where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };
    }
    if (query.search !== undefined && query.search !== null && query.search !== "") {
      where.patientFullName = { contains: query.search, mode: "insensitive" };
    }

    const [cases, total] = await Promise.all([
      prisma.malariaCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.malariaCase.count({ where }),
    ]);

    res.json({ cases, total, page });
  } catch (error) {
    console.error("Get cases error:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

adminCasesRouter.get("/cases/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const caseId = req.params.id;

    const malariaCase = await prisma.malariaCase.findUnique({
      where: { id: caseId },
    });

    if (malariaCase === null) {
      const suffix = caseId.slice(-6);
      const caseBySuffix = await prisma.malariaCase.findFirst({
        where: { id: { endsWith: suffix } },
      });
      if (caseBySuffix === null) {
        res.status(404).json({ error: "Case not found" });
        return;
      }
      res.json(caseBySuffix);
      return;
    }

    res.json(malariaCase);
  } catch (error) {
    console.error("Get case error:", error);
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

adminCasesRouter.get("/analytics/summary", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as CasesQuery;

    const where: {
      facilityName?: string;
      status?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.facility !== undefined && query.facility !== null && query.facility !== "") {
      where.facilityName = query.facility;
    }
    if (query.status !== undefined && query.status !== null && query.status !== "") {
      where.status = query.status;
    }
    if (query.dateFrom !== undefined && query.dateFrom !== null && query.dateFrom !== "") {
      where.createdAt = { ...where.createdAt, gte: new Date(query.dateFrom) };
    }
    if (query.dateTo !== undefined && query.dateTo !== null && query.dateTo !== "") {
      where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };
    }

    const [
      totalCases,
      draftCases,
      submittedCases,
      rdtPositive,
      rdtNegative,
      microscopyPositive,
      microscopyNegative,
      casesByFacility,
    ] = await Promise.all([
      prisma.malariaCase.count({ where }),
      prisma.malariaCase.count({ where: { ...where, status: "draft" } }),
      prisma.malariaCase.count({ where: { ...where, status: "submitted" } }),
      prisma.malariaCase.count({ where: { ...where, rdtResult: "positive" } }),
      prisma.malariaCase.count({ where: { ...where, rdtResult: "negative" } }),
      prisma.malariaCase.count({ where: { ...where, microscopyResult: "positive" } }),
      prisma.malariaCase.count({ where: { ...where, microscopyResult: "negative" } }),
      prisma.malariaCase.groupBy({
        by: ["facilityName"],
        _count: { _all: true },
        where,
        orderBy: { facilityName: "asc" },
      }),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeriesData = await prisma.malariaCase.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyCounts = timeSeriesData.reduce((acc: Record<string, number>, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] ?? 0) + item._count._all;
      return acc;
    }, {});

    const trendData = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      totalCases,
      casesByStatus: {
        draft: draftCases,
        submitted: submittedCases,
      },
      rdtResults: {
        positive: rdtPositive,
        negative: rdtNegative,
      },
      microscopyResults: {
        positive: microscopyPositive,
        negative: microscopyNegative,
      },
      casesByFacility: casesByFacility.map((f) => ({
        facility: f.facilityName,
        count: f._count._all,
      })),
      trendData,
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});