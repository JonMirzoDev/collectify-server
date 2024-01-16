import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsArray()
  @IsString({ each: true })
  readonly tags: string[];
}
