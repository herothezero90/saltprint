import {createReadStream} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {defaultSiteContent} from '../../src/content/defaultContent'

const client = getCliClient({apiVersion: '2026-07-15'})
const currentVolume = defaultSiteContent.currentVolume

async function seed() {
  const existingDocuments = await client.fetch<number>(
    'count(*[_id in ["siteSettings", "volume-01"]])',
  )

  if (existingDocuments > 0) {
    throw new Error(
      'Seed stopped because siteSettings or volume-01 already exists. Delete neither automatically; edit the existing documents in Studio instead.',
    )
  }

  const imagePath = resolve(process.cwd(), '../public/images/volume_1.jpg')
  const imageAsset = await client.assets.upload('image', createReadStream(imagePath), {
    filename: 'volume_1.jpg',
    title: `Volume ${currentVolume.volumeNumber}: ${currentVolume.title}`,
  })

  const volumeDocument = {
    _id: 'volume-01',
    _type: 'volume',
    volumeNumber: currentVolume.volumeNumber,
    title: currentVolume.title,
    prompt: currentVolume.prompt,
    body: currentVolume.body,
    image: {
      _type: 'image',
      asset: {_type: 'reference', _ref: imageAsset._id},
    },
    imageAlt: currentVolume.imageAlt,
    imageCredit: currentVolume.imageCredit,
    publicationDate: currentVolume.publicationDate,
  }

  const siteSettingsDocument = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    hero: defaultSiteContent.hero,
    currentVolume: {_type: 'reference', _ref: volumeDocument._id},
    archivedVolumes: [],
    archive: defaultSiteContent.archive,
    submissions: {
      ...defaultSiteContent.submissions,
      importantDates: defaultSiteContent.submissions.importantDates.map((item, index) => ({
        ...item,
        _key: `important-date-${index + 1}`,
        _type: 'importantDate',
      })),
    },
    howToSubmit: {
      ...defaultSiteContent.howToSubmit,
      steps: defaultSiteContent.howToSubmit.steps.map((step, index) => ({
        ...step,
        _key: `submission-step-${index + 1}`,
        _type: 'submissionStep',
      })),
    },
    faqs: defaultSiteContent.faqs.map((faq, index) => ({
      ...faq,
      _key: `faq-${index + 1}`,
      _type: 'faqItem',
    })),
  }

  await client.transaction().create(volumeDocument).create(siteSettingsDocument).commit()

  console.log('Created Volume 01 and the Website content singleton in Sanity.')
}

seed().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
