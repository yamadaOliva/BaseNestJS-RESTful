import { IsString , IsNotEmpty } from "class-validator";
export class ChatDTO {
    id: string;
    @IsNotEmpty()
    @IsString()
    content: string;
    @IsString()
    imageUrl?: string;
    fromUserId: string;
    toUserId: string;
}