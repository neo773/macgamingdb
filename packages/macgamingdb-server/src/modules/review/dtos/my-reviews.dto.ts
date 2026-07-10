import { z } from 'zod';
import { MyReviewSchema } from './my-review.dto';

export const MyReviewsSchema = z.array(MyReviewSchema);
