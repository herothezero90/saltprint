import {createClient} from '@sanity/client'

export const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id'
export const sanityDataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production'
export const isSanityConfigured = sanityProjectId !== 'your-project-id'

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: '2026-07-15',
  useCdn: false,
})
