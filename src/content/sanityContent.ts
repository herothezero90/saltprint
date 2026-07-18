import {defaultSiteContent} from './defaultContent'
import type {SiteContent, VolumeContent} from './types'
import {isSanityConfigured, sanityClient} from '../sanity'

const siteContentQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  hero,
  "volumes": *[_type == "volume"] | order(volumeNumber desc){
    "id": _id,
    volumeNumber,
    "slug": "volume-" + volumeNumber,
    title,
    prompt,
    body,
    "imageUrl": image.asset->url,
    "imageWidth": image.asset->metadata.dimensions.width,
    "imageHeight": image.asset->metadata.dimensions.height,
    imageAlt,
    imageCredit,
    publicationDate
  },
  submissions{
    importantDates[]{label, value},
    whoCanSubmit{heading, body},
    whatToSubmit{heading, body},
    rules{heading, body},
    selection{heading, body}
  },
  howToSubmit{
    steps[]{title, body, codeExample},
    statusCard{visible, title, body},
    privacyHeading,
    privacyBody
  },
  faqs[]{question, answer},
  archive{title, intro, seoDescription}
}`

interface SanityContentResponse
  extends Omit<Partial<SiteContent>, 'currentVolume' | 'archivedVolumes'> {
  volumes?: Partial<VolumeContent>[]
}

function mergeVolume(volume: Partial<VolumeContent>, fallback: VolumeContent): VolumeContent {
  return {...fallback, ...volume}
}

function normalizeSiteContent(raw: SanityContentResponse): SiteContent {
  const fallback = defaultSiteContent
  const volumes = Array.isArray(raw.volumes)
    ? raw.volumes.map((volume) => mergeVolume(volume, fallback.currentVolume))
    : []

  return {
    hero: {...fallback.hero, ...raw.hero},
    currentVolume: volumes[0] ?? fallback.currentVolume,
    archivedVolumes: volumes.slice(1),
    submissions: {
      ...fallback.submissions,
      ...raw.submissions,
      whoCanSubmit: {
        ...fallback.submissions.whoCanSubmit,
        ...raw.submissions?.whoCanSubmit,
      },
      whatToSubmit: {
        ...fallback.submissions.whatToSubmit,
        ...raw.submissions?.whatToSubmit,
      },
      rules: {...fallback.submissions.rules, ...raw.submissions?.rules},
      selection: {...fallback.submissions.selection, ...raw.submissions?.selection},
    },
    howToSubmit: {
      ...fallback.howToSubmit,
      ...raw.howToSubmit,
      statusCard: {
        ...fallback.howToSubmit.statusCard,
        ...raw.howToSubmit?.statusCard,
      },
    },
    faqs: Array.isArray(raw.faqs) ? raw.faqs : fallback.faqs,
    archive: {...fallback.archive, ...raw.archive},
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured) {
    return defaultSiteContent
  }

  const content = await sanityClient.fetch<SanityContentResponse | null>(siteContentQuery)

  if (!content?.volumes?.length) {
    throw new Error(
      'Sanity is configured, but the siteSettings document or a published volume is missing.',
    )
  }

  return normalizeSiteContent(content)
}
