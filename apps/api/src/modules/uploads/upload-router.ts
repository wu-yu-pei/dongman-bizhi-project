import { Router } from "express";
import { z } from "zod";
import { buildSuccessResponse } from "../../shared/http-response.js";
import { validateBody } from "../../shared/validate-request.js";
import type { OssPolicyService } from "./oss-policy-service.js";

const uploadPolicyBodySchema = z.object({
  filename: z.string().trim().min(1, "文件名不能为空").max(255),
  contentType: z.string().trim().min(1, "文件类型不能为空").max(100),
});

export function createUploadRouter(policyService: OssPolicyService): Router {
  const router = Router();

  router.post(
    "/admin/uploads/oss-policy",
    validateBody(uploadPolicyBodySchema),
    (req, res, next) => {
      try {
        res.json(
          buildSuccessResponse(policyService.createUploadPolicy(req.body)),
        );
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
