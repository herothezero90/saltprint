import type {PortableTextBlock} from '@portabletext/types'

export type RichText = PortableTextBlock[]

export interface HeroContent {
  eyebrow: string
  volumeLabel: string
  title: string
  announcement: string
}

export type ScheduleTimingMode =
  | 'soon'
  | 'tbd'
  | 'monthYear'
  | 'exactDate'
  | 'custom'

export interface ScheduleTiming {
  mode: ScheduleTimingMode
  month?: number
  year?: number
  date?: string
  customText?: string
}

export interface VolumeSchedule {
  submissionsOpen: ScheduleTiming
  submissionDeadline: ScheduleTiming
  selectedPhotographersContacted: ScheduleTiming
  publication: ScheduleTiming
}

export interface VolumeContent {
  id: string
  volumeNumber: string
  slug: string
  title: string
  prompt: string
  body: RichText
  imageUrl: string
  imageSrcset?: string
  imageWidth: number
  imageHeight: number
  imageAlt: string
  imageCredit: string
  schedule?: VolumeSchedule
  publicationDate?: string
}

export interface ImportantDate {
  label: string
  value: string
}

export interface ContentSection {
  heading: string
  body: RichText
}

export interface SubmissionsContent {
  importantDates: ImportantDate[]
  whoCanSubmit: ContentSection
  whatToSubmit: ContentSection
  rules: ContentSection
  selection: ContentSection
}

export interface SubmissionStep {
  title: string
  body: RichText
  codeExample?: string
}

export interface HowToSubmitContent {
  steps: SubmissionStep[]
  statusCard: {
    visible: boolean
    title: string
    body: string
    formUrl: string
  }
  privacyHeading: string
  privacyBody: RichText
}

export interface FaqItem {
  question: string
  answer: RichText
}

export interface ArchiveContent {
  title: string
  intro: string
  seoDescription: string
}

export interface SiteContent {
  hero: HeroContent
  currentVolume: VolumeContent
  archivedVolumes: VolumeContent[]
  submissions: SubmissionsContent
  howToSubmit: HowToSubmitContent
  faqs: FaqItem[]
  archive: ArchiveContent
}
