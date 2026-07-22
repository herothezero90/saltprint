import type {ImportantDate, RichText, ScheduleTiming, VolumeSchedule} from './types'

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const exactDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function dateParts(value: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return [year, month, day]
}

export function isValidScheduleDate(value: string): boolean {
  return dateParts(value) !== null
}

export function formatScheduleTiming(timing: ScheduleTiming): string {
  switch (timing.mode) {
    case 'soon':
      return 'Soon'
    case 'tbd':
      return 'TBD'
    case 'monthYear': {
      if (
        !Number.isInteger(timing.month) ||
        !Number.isInteger(timing.year) ||
        (timing.month ?? 0) < 1 ||
        (timing.month ?? 0) > 12
      ) {
        return ''
      }

      return monthFormatter.format(
        new Date(Date.UTC(timing.year as number, (timing.month as number) - 1, 1)),
      )
    }
    case 'exactDate': {
      const parts = timing.date ? dateParts(timing.date) : null
      if (!parts) return ''

      const [year, month, day] = parts
      return exactDateFormatter.format(new Date(Date.UTC(year, month - 1, day)))
    }
    case 'custom':
      return timing.customText?.trim() ?? ''
  }
}

export function exactPublicationDate(timing: ScheduleTiming): string | undefined {
  return timing.mode === 'exactDate' && timing.date && isValidScheduleDate(timing.date)
    ? timing.date
    : undefined
}

export function importantDatesFromSchedule(
  volumeNumber: string,
  schedule: VolumeSchedule,
): ImportantDate[] {
  return [
    {label: 'Submissions open', value: formatScheduleTiming(schedule.submissionsOpen)},
    {
      label: 'Submission deadline',
      value: formatScheduleTiming(schedule.submissionDeadline),
    },
    {
      label: 'Selected photographers contacted',
      value: formatScheduleTiming(schedule.selectedPhotographersContacted),
    },
    {
      label: `Volume ${volumeNumber} publication`,
      value: formatScheduleTiming(schedule.publication),
    },
  ]
}

export function publicationFaqAnswer(
  publication: ScheduleTiming,
  answerPrefix = 'Planned for',
): RichText {
  let text: string

  if (publication.mode === 'soon') {
    text = 'Publication is coming soon.'
  } else if (publication.mode === 'tbd') {
    text = 'The publication date is still to be announced.'
  } else {
    const value = formatScheduleTiming(publication)
    const sentence = `${answerPrefix.trim()} ${value}`.trim()
    text = /[.!?]$/.test(sentence) ? sentence : `${sentence}.`
  }

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
