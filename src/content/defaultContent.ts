import type {PortableTextBlock} from '@portabletext/types'
import type {RichText, SiteContent} from './types'

let blockIndex = 0

function block(text: string, options: {listItem?: 'bullet'} = {}): PortableTextBlock {
  blockIndex += 1

  return {
    _type: 'block',
    _key: `default-block-${blockIndex}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `default-span-${blockIndex}`,
        text,
        marks: [],
      },
    ],
    ...(options.listItem ? {listItem: options.listItem, level: 1} : {}),
  }
}

function paragraphs(...values: string[]): RichText {
  return values.map((value) => block(value))
}

function bullets(...values: string[]): RichText {
  return values.map((value) => block(value, {listItem: 'bullet'}))
}

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: 'OPEN CALL',
    volumeLabel: 'VOL.01',
    title: 'From Where You Stand',
    announcement: 'STARTING SOON',
  },
  currentVolume: {
    id: 'volume-01',
    volumeNumber: '01',
    slug: 'volume-01',
    title: 'From Where You Stand',
    prompt: 'What do you see from where you stand?',
    body: paragraphs(
      'This theme is about point of view - literal, emotional, political, personal, or poetic. It can be a photograph taken from your window, your street, your daily walk, workplace, last vacation, or your corner of Europe.',
      'It is not about finding the most dramatic location. It is about attention - the way a place looks when seen by you, from your position, in that moment. Your photograph can be quiet, strange, beautiful, ordinary, or unresolved. We are looking for images that feel observed rather than forced.',
    ),
    imageUrl: '/images/volume_1.jpg',
    imageWidth: 1280,
    imageHeight: 999,
    imageAlt: 'A woman standing behind a window, photographed in black and white',
    imageCredit: 'Petra Zegnal',
    publicationDate: '2026-10-01',
  },
  archivedVolumes: [],
  submissions: {
    importantDates: [
      {label: 'Submissions open', value: 'Soon'},
      {label: 'Submission deadline', value: 'TBD'},
      {label: 'Selected photographers contacted', value: 'September 2026'},
      {label: 'Volume 01 publication', value: 'October 2026'},
    ],
    whoCanSubmit: {
      heading: 'Who Can Submit',
      body: paragraphs(
        'Anyone over the age of 18 can submit. You do not need to be a professional photographer - beginners, students, self-taught, and previously unpublished photographers are all welcome. You can submit from any country, but the photograph itself must have been taken in Europe.',
      ),
    },
    whatToSubmit: {
      heading: 'What You Can Submit',
      body: paragraphs(
        'One photograph responding to the theme From Where You Stand, taken somewhere in Europe. Digital, film, black and white, colour, street, documentary, landscape, portrait - any approach is welcome, shot on a camera or a phone. AI-generated images are not accepted.',
      ),
    },
    rules: {
      heading: 'Submission Rules',
      body: bullets(
        'Submit only your own original work - you must own the rights to the image.',
        'Only one photograph per person for this volume.',
        'Basic editing and post-processing are allowed, including cropping, colour correction, exposure adjustments, contrast, and dust removal. Do not add watermarks, borders, logos, or text to the image.',
        "By submitting, you confirm you're the creator and give SALTPRINT permission to publish the selected photograph in print, on the website, and on social media, with credit. You keep full copyright.",
      ),
    },
    selection: {
      heading: 'How Selection Works',
      body: paragraphs(
        "Photographs are reviewed based on connection to the theme, visual strength, atmosphere, and originality - not technical perfection. We're looking for images that stay with us. Selected photographers will be contacted by email before publication.",
        'Three featured photographers from each volume will also be invited to take part in a short written interview.',
      ),
    },
  },
  howToSubmit: {
    steps: [
      {
        title: 'Complete the form',
        body: paragraphs(
          'Provide your name, email, photograph title, location, and a short note about why the image mattered to you.',
        ),
      },
      {
        title: 'Upload your photograph',
        body: paragraphs('Upload one image as a JPG or PNG file, maximum 10 MB.'),
      },
      {
        title: 'Name your file clearly',
        body: paragraphs('Use this format:'),
        codeExample: 'FirstName_LastName_PhotoTitle.jpg',
      },
    ],
    statusCard: {
      visible: true,
      title: 'Submit here',
      body: 'The submission form will be available here when the open call begins.',
      formUrl: '',
    },
    privacyHeading: 'Your privacy',
    privacyBody: paragraphs(
      'Your name, email address, submission text, and photograph will be used only to review your submission and contact you about the next volume. Unselected submissions will be deleted after the selection process. Mailing-list subscriptions are handled separately.',
    ),
  },
  faqs: [
    {
      question: 'Do I need to be a professional photographer?',
      answer: paragraphs('No. Beginners, hobbyists, students, and professionals alike.'),
    },
    {
      question: 'Does the photo have to be taken in Europe?',
      answer: paragraphs(
        "Yes, the submitted photograph must be taken somewhere in Europe, though you don't have to live there.",
      ),
    },
    {
      question: 'Can I submit more than one photo?',
      answer: paragraphs('For Volume 01, please submit only one.'),
    },
    {
      question: 'Can I submit an old photograph?',
      answer: paragraphs('Yes, as long as it fits the theme and was taken in Europe.'),
    },
    {
      question: 'Can I use AI-generated images or Photoshop/Lightroom?',
      answer: paragraphs(
        'AI-generated images are not accepted. Standard editing (cropping, colour correction, exposure, contrast, dust removal) is fine.',
      ),
    },
    {
      question: 'Will I keep the copyright to my photograph? What rights do I give to SALTPRINT?',
      answer: paragraphs(
        'You retain full copyright to your photograph. If selected, you grant SALTPRINT non-exclusive permission to reproduce the photograph in the relevant print and digital volume and to use it on the SALTPRINT website and social media when promoting the zine, always with credit. SALTPRINT will not sell or license your photograph to third parties.',
      ),
    },
    {
      question: 'Is there a submission fee? Will I be paid if selected?',
      answer: paragraphs(
        "Submission is free. SALTPRINT is an independent, self-funded project, so selected photographers won't be paid for Volume 01 — the goal is to build a printed platform and community around emerging and overlooked photography.",
      ),
    },
    {
      question: 'Will I receive a free copy if selected?',
      answer: paragraphs(
        'The three featured photographers will receive a complimentary print copy. All other selected photographers will receive a digital copy.',
      ),
    },
    {
      question: 'When will the volume be published?',
      answer: paragraphs('Planned for October 2026.'),
    },
  ],
  archive: {
    title: 'Archive',
    intro: 'Past Saltprint Volumes',
    seoDescription: 'Explore past SALTPRINT photography zine volumes and their open-call themes.',
  },
}
