import { z } from "zod";
import { BulkImportEmployeesSchema } from "../employees";

export const BulkImportPreviewSchema = BulkImportEmployeesSchema;
export type BulkImportPreviewDto = z.infer<typeof BulkImportPreviewSchema>;
