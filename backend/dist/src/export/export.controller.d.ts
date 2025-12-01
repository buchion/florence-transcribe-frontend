import { ExportService } from './export.service';
import { ExportDto } from './dto/export.dto';
export declare class ExportController {
    private exportService;
    constructor(exportService: ExportService);
    export(dto: ExportDto): Promise<{
        export_log_id: number;
        status: string;
        fhir_bundle: any;
        error_message: string | null;
        created_at: string;
    }>;
}
