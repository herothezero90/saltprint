import {defineField, defineType} from 'sanity'

const timingModes = [
  {title: 'Soon', value: 'soon'},
  {title: 'TBD', value: 'tbd'},
  {title: 'Month and year', value: 'monthYear'},
  {title: 'Exact date', value: 'exactDate'},
  {title: 'Custom text', value: 'custom'},
]

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((title, index) => ({title, value: index + 1}))

interface TimingParent {
  mode?: string
}

export const scheduleTiming = defineType({
  name: 'scheduleTiming',
  title: 'Schedule timing',
  type: 'object',
  fields: [
    defineField({
      name: 'mode',
      title: 'What should be shown?',
      type: 'string',
      options: {list: timingModes, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'number',
      options: {list: months},
      hidden: ({parent}) => (parent as TimingParent | undefined)?.mode !== 'monthYear',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as TimingParent | undefined
          if (parent?.mode !== 'monthYear') return true
          return typeof value === 'number' &&
            Number.isInteger(value) &&
            value >= 1 &&
            value <= 12
            ? true
            : 'Choose a month.'
        }),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      hidden: ({parent}) => (parent as TimingParent | undefined)?.mode !== 'monthYear',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as TimingParent | undefined
          if (parent?.mode !== 'monthYear') return true
          return typeof value === 'number' &&
            Number.isInteger(value) &&
            value >= 2000 &&
            value <= 2100
            ? true
            : 'Enter a four-digit year.'
        }),
    }),
    defineField({
      name: 'date',
      title: 'Exact date',
      type: 'date',
      hidden: ({parent}) => (parent as TimingParent | undefined)?.mode !== 'exactDate',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as TimingParent | undefined
          return parent?.mode !== 'exactDate' || value
            ? true
            : 'Choose an exact date.'
        }),
    }),
    defineField({
      name: 'customText',
      title: 'Custom text',
      description:
        'For example Late 2026. When used for Publication, this text follows the editable FAQ prefix.',
      type: 'string',
      hidden: ({parent}) => (parent as TimingParent | undefined)?.mode !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as TimingParent | undefined
          return parent?.mode !== 'custom' || value?.trim()
            ? true
            : 'Enter the text to display.'
        }),
    }),
  ],
  preview: {
    select: {
      mode: 'mode',
      month: 'month',
      year: 'year',
      date: 'date',
      customText: 'customText',
    },
    prepare({mode, month, year, date, customText}) {
      const modeTitle = timingModes.find((item) => item.value === mode)?.title
      const monthTitle = months.find((item) => item.value === month)?.title
      const subtitle =
        mode === 'monthYear'
          ? [monthTitle, year].filter(Boolean).join(' ')
          : mode === 'exactDate'
            ? date
            : mode === 'custom'
              ? customText
              : undefined

      return {title: modeTitle ?? 'Choose what should be shown', subtitle}
    },
  },
})
