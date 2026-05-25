import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ example: 'This task is blocked until the API keys are provided.', description: 'The text content of your comment' })
    @IsString()
    @IsNotEmpty()
    content: string;
}