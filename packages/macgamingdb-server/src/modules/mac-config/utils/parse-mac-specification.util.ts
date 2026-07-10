import {
  MacSpecificationSchema,
  type MacSpecification,
} from '../dtos/mac-specification.dto';

export const parseMacSpecificationOrThrow = (metadata: string): MacSpecification =>
  MacSpecificationSchema.parse(JSON.parse(metadata));
