import {defineField, defineType} from 'sanity'

const legacyScheduleTimingFields = [
  defineField({name: 'mode', title: 'Mode', type: 'string'}),
  defineField({name: 'month', title: 'Month', type: 'number'}),
  defineField({name: 'year', title: 'Year', type: 'number'}),
  defineField({name: 'date', title: 'Date', type: 'date'}),
  defineField({name: 'customText', title: 'Custom text', type: 'string'}),
]

export const volume = defineType({
  name: 'volume',
  title: 'Volume',
  type: 'document',
  fields: [
    defineField({
      name: 'volumeNumber',
      title: 'Volume number',
      description:
        'Use two digits, for example 01 or 02. The highest published number automatically becomes the current volume.',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^\d{2}$/, {name: 'two digits'})
          .custom(async (value, context) => {
            if (!value) return true

            const documentId = (context.document?._id ?? '').replace(/^drafts\./, '')
            const duplicateCount = await context
              .getClient({apiVersion: '2026-07-15'})
              .fetch<number>(
                `count(*[
                  _type == "volume" &&
                  volumeNumber == $volumeNumber &&
                  !(_id in [$documentId, $draftId])
                ])`,
                {
                  volumeNumber: value,
                  documentId,
                  draftId: `drafts.${documentId}`,
                },
              )

            return duplicateCount === 0 || 'Another volume already uses this number.'
          }),
    }),
    defineField({
      name: 'slug',
      title: 'Legacy slug',
      type: 'slug',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'title',
      title: 'Title / theme',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prompt',
      title: 'Opening question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Volume description',
      type: 'richText',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'image',
      title: 'Featured photograph',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageAlt',
      title: 'Image description (alt text)',
      description: 'Describe what is visible for accessibility and search engines.',
      type: 'string',
      validation: (Rule) => Rule.required().min(10),
    }),
    defineField({
      name: 'imageCredit',
      title: 'Photographer credit',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'schedule',
      title: 'Legacy schedule',
      type: 'object',
      hidden: true,
      readOnly: true,
      fields: [
        defineField({
          name: 'submissionsOpen',
          title: 'Submissions open',
          type: 'object',
          fields: legacyScheduleTimingFields,
        }),
        defineField({
          name: 'submissionDeadline',
          title: 'Submission deadline',
          type: 'object',
          fields: legacyScheduleTimingFields,
        }),
        defineField({
          name: 'selectedPhotographersContacted',
          title: 'Selected photographers contacted',
          type: 'object',
          fields: legacyScheduleTimingFields,
        }),
        defineField({
          name: 'publication',
          title: 'Publication',
          type: 'object',
          fields: legacyScheduleTimingFields,
        }),
      ],
    }),
    defineField({
      name: 'publicationDate',
      title: 'Publication date',
      type: 'date',
    }),
  ],
  orderings: [
    {
      title: 'Volume number, newest first',
      name: 'volumeNumberDesc',
      by: [{field: 'volumeNumber', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      volumeNumber: 'volumeNumber',
      media: 'image',
    },
    prepare({title, volumeNumber, media}) {
      return {
        title: `Volume ${volumeNumber ?? '—'}: ${title ?? 'Untitled'}`,
        media,
      }
    },
  },
})
