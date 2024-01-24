import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

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

  @IsNotEmpty()
  @IsNumber()
  readonly collectionId: number;
}
