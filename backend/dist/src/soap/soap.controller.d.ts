import { SoapService } from './soap.service';
import { ComposeDto } from './dto/compose.dto';
import { User } from '../users/entities/user.entity';
export declare class SoapController {
    private soapService;
    constructor(soapService: SoapService);
    compose(dto: ComposeDto, user: User): Promise<{
        soap_note_id: number;
        html_content: string;
        billing_codes: any;
        created_at: string;
    }>;
}
