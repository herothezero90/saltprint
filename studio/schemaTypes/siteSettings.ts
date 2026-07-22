import {defineArrayMember, defineField, defineType} from 'sanity'

interface FaqParent {
  answerSource?: string
}

const sectionFields = [
  defineField({
    name: 'heading',
    title: 'Heading',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'body',
    title: 'Content',
    type: 'richText',
    validation: (Rule) => Rule.required().min(1),
  }),
]

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website content',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Open Call'},
    {name: 'volumes', title: 'Archive page'},
    {name: 'submissions', title: 'Rules & Selection'},
    {name: 'howToSubmit', title: 'How to Submit'},
    {name: 'faq', title: 'FAQ'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Open Call card',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Label',
          type: 'string',
          initialValue: 'OPEN CALL',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'volumeLabel',
          title: 'Volume label',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Call title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'announcement',
          title: 'Announcement line',
          description:
            'Enter text only, for example STARTING SOON or SUBMIT NOW. Do not paste the Google Form URL here. When a form URL is added under How to Submit → Status card, this line automatically links to the How to Submit section. Clear this field to remove the line from the card.',
          type: 'string',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'archive',
      title: 'Archive page text and SEO',
      type: 'object',
      group: 'volumes',
      fields: [
        defineField({
          name: 'title',
          title: 'Page title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Subtitle',
          description: 'Shown directly below the Archive title.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'seoDescription',
          title: 'Search description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required().max(160),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'archivedVolumes',
      title: 'Legacy archived volumes',
      type: 'array',
      hidden: true,
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'volume'}],
        }),
      ],
    }),
    defineField({
      name: 'submissions',
      title: 'Submission Rules and Selection',
      type: 'object',
      group: 'submissions',
      fields: [
        defineField({
          name: 'importantDates',
          title: 'Important dates',
          description: 'Legacy values kept until every volume has its own Schedule.',
          type: 'array',
          hidden: true,
          of: [
            defineArrayMember({
              type: 'object',
              name: 'importantDate',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'value',
                  title: 'Date or status',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {select: {title: 'label', subtitle: 'value'}},
            }),
          ],
        }),
        defineField({
          name: 'whoCanSubmit',
          title: 'Who Can Submit',
          type: 'object',
          fields: sectionFields,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'whatToSubmit',
          title: 'What You Can Submit',
          type: 'object',
          fields: sectionFields,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'rules',
          title: 'Submission Rules',
          type: 'object',
          fields: sectionFields,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'selection',
          title: 'How Selection Works',
          type: 'object',
          fields: sectionFields,
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'howToSubmit',
      title: 'How to Submit',
      type: 'object',
      group: 'howToSubmit',
      fields: [
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'submissionStep',
              title: 'Step',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'body',
                  title: 'Content',
                  type: 'richText',
                  validation: (Rule) => Rule.required().min(1),
                }),
                defineField({
                  name: 'codeExample',
                  title: 'Optional filename example',
                  type: 'string',
                }),
              ],
              preview: {select: {title: 'title'}},
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(6),
        }),
        defineField({
          name: 'statusCard',
          title: 'Status card',
          type: 'object',
          fields: [
            defineField({
              name: 'visible',
              title: 'Show this card',
              type: 'boolean',
              initialValue: true,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Text',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'formUrl',
              title: 'Google Form URL',
              description:
                'Leave empty while submissions are closed. When a URL is added, this card becomes a link and the hero announcement links to this section.',
              type: 'url',
              validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
            }),
          ],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'privacyHeading',
          title: 'Privacy heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'privacyBody',
          title: 'Privacy text',
          type: 'richText',
          validation: (Rule) => Rule.required().min(1),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'faqs',
      title: 'Frequently asked questions',
      type: 'array',
      group: 'faq',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'FAQ item',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answerSource',
              title: 'Answer source',
              description:
                'Existing items without a selection behave as Custom answer. Choose the publication timing option to keep this answer synchronized with the current Volume schedule.',
              type: 'string',
              initialValue: 'custom',
              options: {
                list: [
                  {title: 'Custom answer', value: 'custom'},
                  {
                    title: 'Current Volume publication timing',
                    value: 'currentVolumePublication',
                  },
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'richText',
              hidden: ({parent}) =>
                (parent as FaqParent | undefined)?.answerSource ===
                'currentVolumePublication',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as FaqParent | undefined
                  if (parent?.answerSource === 'currentVolumePublication') return true
                  return Array.isArray(value) && value.length
                    ? true
                    : 'Enter an answer.'
                }),
            }),
            defineField({
              name: 'answerPrefix',
              title: 'Text before the publication date',
              description:
                'Used for month, exact-date, and custom values. For example Planned for. Leave empty to use Planned for. Soon and TBD use automatic sentences.',
              type: 'string',
              initialValue: 'Planned for',
              hidden: ({parent}) =>
                (parent as FaqParent | undefined)?.answerSource !==
                'currentVolumePublication',
            }),
          ],
          preview: {
            select: {title: 'question', answerSource: 'answerSource'},
            prepare({title, answerSource}) {
              return {
                title,
                subtitle:
                  answerSource === 'currentVolumePublication'
                    ? 'Uses the current Volume publication timing'
                    : undefined,
              }
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((items) => {
            const publicationAnswerCount = (items ?? []).filter(
              (item) =>
                (item as FaqParent | undefined)?.answerSource ===
                'currentVolumePublication',
            ).length

            return publicationAnswerCount <= 1
              ? true
              : 'Only one FAQ can use the current Volume publication timing.'
          }),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Website content'}
    },
  },
})
