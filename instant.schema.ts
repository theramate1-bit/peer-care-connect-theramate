// instant.schema.ts
import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    videos: i.entity({
      title: i.string(),
      brandName: i.string(),
      productName: i.string(),
      template: i.string(),
      status: i.string().indexed(), // 'pending', 'processing', 'completed', 'failed'
      taskId: i.string().optional(), // Kie.ai task ID for tracking
      videoUrl: i.string().optional(),
      thumbnailUrl: i.string().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
  },
  rooms: {},
  links: {},
});

// This helps Typescript display better intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;