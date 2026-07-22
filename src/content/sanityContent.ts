import {defaultSiteContent} from './defaultContent'
import type {SanityImageSource} from '@sanity/image-url'
import type {
  ArchiveContent,
  ContentSection,
  FaqItem,
  HeroContent,
  HowToSubmitContent,
  ImportantDate,
  SiteContent,
  SubmissionsContent,
  VolumeContent,
} from './types'
import {isSanityConfigured, sanityClient, sanityImageBuilder} from '../sanity'

const siteContentQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  hero,
  "volumes": *[_type == "volume"] | order(volumeNumber desc){
    "id": _id,
    volumeNumber,
    "slug": "volume-" + volumeNumber,
    title,
    prompt,
    body,
    image{asset, crop, hotspot},
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
    statusCard{visible, title, body, formUrl},
    privacyHeading,
    privacyBody
  },
  faqs[]{question, answer, answerSource},
  archive{title, intro, seoDescription}
}`

type NullablePartial<T> = {[Key in keyof T]?: T[Key] | null}

type SanityVolumeResponse = NullablePartial<
  Omit<VolumeContent, 'imageUrl' | 'imageSrcset'>
> & {
  image?: SanityImageSource | null
}

type SanitySubmissionsResponse = Omit<
  NullablePartial<SubmissionsContent>,
  'whoCanSubmit' | 'whatToSubmit' | 'rules' | 'selection'
> & {
  whoCanSubmit?: NullablePartial<ContentSection> | null
  whatToSubmit?: NullablePartial<ContentSection> | null
  rules?: NullablePartial<ContentSection> | null
  selection?: NullablePartial<ContentSection> | null
}

type SanityHowToSubmitResponse = Omit<
  NullablePartial<HowToSubmitContent>,
  'statusCard'
> & {
  statusCard?: NullablePartial<HowToSubmitContent['statusCard']> | null
}

interface SanityFaqResponse extends NullablePartial<FaqItem> {
  answerSource?: 'custom' | 'currentVolumePublication' | null
}

interface SanityContentResponse {
  hero?: NullablePartial<HeroContent> | null
  volumes?: SanityVolumeResponse[] | null
  submissions?: SanitySubmissionsResponse | null
  howToSubmit?: SanityHowToSubmitResponse | null
  faqs?: SanityFaqResponse[] | null
  archive?: NullablePartial<ArchiveContent> | null
}

function mergeDefined<T extends object>(fallback: T, value?: NullablePartial<T> | null): T {
  if (!value) return fallback

  const definedEntries = Object.entries(value).filter(
    ([, entryValue]) => entryValue !== null && entryValue !== undefined,
  )

  return {...fallback, ...Object.fromEntries(definedEntries)} as T
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function cmsBuildError(message: string, cause?: unknown): Error {
  return new Error(`[Saltprint CMS] ${message}`, {cause})
}

function imageUrl(image: SanityImageSource, width: number, quality: number): string {
  return sanityImageBuilder
    .image(image)
    .auto('format')
    .fit('max')
    .width(width)
    .quality(quality)
    .url()
}

function normalizeVolume(raw: SanityVolumeResponse, index: number): VolumeContent {
  const assetWidth = typeof raw.imageWidth === 'number' ? raw.imageWidth : 0
  const assetHeight = typeof raw.imageHeight === 'number' ? raw.imageHeight : 0
  const imageRecord = raw.image as
    | (Record<string, unknown> & {
        crop?: {left?: number; right?: number; top?: number; bottom?: number}
      })
    | null
    | undefined
  const crop = imageRecord?.crop
  const croppedWidth = Math.round(
    assetWidth * (1 - (crop?.left ?? 0) - (crop?.right ?? 0)),
  )
  const croppedHeight = Math.round(
    assetHeight * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)),
  )

  const volume: VolumeContent = {
    id: requiredString(raw.id) ?? '',
    volumeNumber: requiredString(raw.volumeNumber) ?? '',
    slug: requiredString(raw.slug) ?? '',
    title: requiredString(raw.title) ?? '',
    prompt: requiredString(raw.prompt) ?? '',
    body: Array.isArray(raw.body) ? raw.body : [],
    imageUrl: raw.image ? imageUrl(raw.image, 1280, 85) : '',
    imageSrcset: raw.image
      ? [
          `${imageUrl(raw.image, 640, 80)} 640w`,
          `${imageUrl(raw.image, 960, 82)} 960w`,
          `${imageUrl(raw.image, 1280, 85)} 1280w`,
        ].join(', ')
      : undefined,
    imageWidth: croppedWidth,
    imageHeight: croppedHeight,
    imageAlt: requiredString(raw.imageAlt) ?? '',
    imageCredit: requiredString(raw.imageCredit) ?? '',
    ...(requiredString(raw.publicationDate)
      ? {publicationDate: raw.publicationDate as string}
      : {}),
  }

  const missing = [
    ['id', volume.id],
    ['volume number', volume.volumeNumber],
    ['slug', volume.slug],
    ['title', volume.title],
    ['prompt', volume.prompt],
    ['body', volume.body.length ? 'present' : ''],
    ['featured image', volume.imageUrl],
    ['image width', volume.imageWidth > 0 ? 'present' : ''],
    ['image height', volume.imageHeight > 0 ? 'present' : ''],
    ['image alt text', volume.imageAlt],
    ['image credit', volume.imageCredit],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label)

  if (missing.length) {
    const identifier = volume.id || `at position ${index + 1}`
    throw cmsBuildError(
      `Published Sanity volume ${identifier} is incomplete: missing ${missing.join(', ')}. Fix it in Sanity Studio, publish it, and rebuild the site.`,
    )
  }

  return volume
}

function publicationFaqAnswer(value: string): FaqItem['answer'] {
  const normalizedValue = value.trim()
  const status = normalizedValue.toLowerCase()
  const text =
    status === 'soon'
      ? 'Publication is coming soon.'
      : status === 'tbd'
        ? 'The publication date is still to be announced.'
        : `Planned for ${normalizedValue}${/[.!?]$/.test(normalizedValue) ? '' : '.'}`

  return [
    {
      _type: 'block',
      _key: 'generated-publication-answer',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'generated-publication-answer-text',
          text,
          marks: [],
        },
      ],
    },
  ]
}

function normalizeFaqs(
  rawFaqs: SanityFaqResponse[] | null | undefined,
  fallbackFaqs: FaqItem[],
  importantDates: ImportantDate[],
): FaqItem[] {
  if (!Array.isArray(rawFaqs)) return fallbackFaqs

  const publicationValue = importantDates.find(({label}) =>
    label.toLowerCase().includes('publication'),
  )?.value

  return rawFaqs.map((rawFaq, index) => {
    const question = requiredString(rawFaq.question)
    if (!question) {
      throw cmsBuildError(
        `Published FAQ at position ${index + 1} is missing its question. Fix it in Sanity Studio, publish it, and rebuild the site.`,
      )
    }

    if (rawFaq.answerSource === 'currentVolumePublication') {
      if (!publicationValue?.trim()) {
        throw cmsBuildError(
          'The publication FAQ uses Important dates, but no Important dates label contains “publication”. Fix the label or choose a custom FAQ answer in Sanity Studio.',
        )
      }

      return {question, answer: publicationFaqAnswer(publicationValue)}
    }

    if (!Array.isArray(rawFaq.answer) || !rawFaq.answer.length) {
      throw cmsBuildError(
        `Published FAQ "${question}" is missing its answer. Fix it in Sanity Studio, publish it, and rebuild the site.`,
      )
    }

    return {question, answer: rawFaq.answer}
  })
}

function normalizeSiteContent(raw: SanityContentResponse): SiteContent {
  const fallback = defaultSiteContent
  const volumes = Array.isArray(raw.volumes)
    ? raw.volumes.map(normalizeVolume)
    : []

  const hero = mergeDefined(fallback.hero, raw.hero)
  if (raw.hero && raw.hero.announcement == null) hero.announcement = ''

  const statusCard = mergeDefined(
    fallback.howToSubmit.statusCard,
    raw.howToSubmit?.statusCard,
  )
  statusCard.formUrl = raw.howToSubmit?.statusCard?.formUrl?.trim() ?? ''

  const submissions = mergeDefined(fallback.submissions, {
    importantDates: raw.submissions?.importantDates,
  })
  const howToSubmit = mergeDefined(fallback.howToSubmit, {
    steps: raw.howToSubmit?.steps,
    privacyHeading: raw.howToSubmit?.privacyHeading,
    privacyBody: raw.howToSubmit?.privacyBody,
  })

  return {
    hero,
    currentVolume: volumes[0] ?? fallback.currentVolume,
    archivedVolumes: volumes.slice(1),
    submissions: {
      ...submissions,
      whoCanSubmit: mergeDefined(
        fallback.submissions.whoCanSubmit,
        raw.submissions?.whoCanSubmit,
      ),
      whatToSubmit: mergeDefined(
        fallback.submissions.whatToSubmit,
        raw.submissions?.whatToSubmit,
      ),
      rules: mergeDefined(fallback.submissions.rules, raw.submissions?.rules),
      selection: mergeDefined(fallback.submissions.selection, raw.submissions?.selection),
    },
    howToSubmit: {
      ...howToSubmit,
      statusCard,
    },
    faqs: normalizeFaqs(raw.faqs, fallback.faqs, submissions.importantDates),
    archive: mergeDefined(fallback.archive, raw.archive),
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured) {
    return defaultSiteContent
  }

  try {
    const content = await sanityClient.fetch<SanityContentResponse | null>(
      siteContentQuery,
    )

    if (!content?.volumes?.length) {
      throw cmsBuildError(
        'Website content or a published volume is missing. Open Sanity Studio, check the published documents, and publish the correction.',
      )
    }

    return normalizeSiteContent(content)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('[Saltprint CMS]')) {
      throw error
    }

    const technicalDetail =
      error instanceof Error ? error.message : 'Unknown Sanity error'

    throw cmsBuildError(
      `Netlify could not load published content from Sanity. Check the latest Netlify deploy log and the last published edit in Sanity Studio. Technical detail: ${technicalDetail}`,
      error,
    )
  }
}
