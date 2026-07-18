import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Saltprint',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Saltprint')
          .items([
            S.listItem()
              .title('Website content')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('volume').title('Volumes'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'siteSettings'),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === 'siteSettings'
        ? actions.filter(
            ({action}) => action !== 'delete' && action !== 'duplicate' && action !== 'unpublish',
          )
        : actions,
  },
})
