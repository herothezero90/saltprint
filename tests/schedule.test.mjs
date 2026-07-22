import assert from 'node:assert/strict'
import test from 'node:test'
import {
  exactPublicationDate,
  formatScheduleTiming,
  importantDatesFromSchedule,
  isValidScheduleDate,
  publicationFaqAnswer,
} from '../src/content/schedule.ts'

function answerText(timing, prefix = 'Planned for') {
  return publicationFaqAnswer(timing, prefix)[0].children[0].text
}

test('formats every supported schedule timing', () => {
  assert.equal(formatScheduleTiming({mode: 'soon'}), 'Soon')
  assert.equal(formatScheduleTiming({mode: 'tbd'}), 'TBD')
  assert.equal(
    formatScheduleTiming({mode: 'monthYear', month: 10, year: 2026}),
    'October 2026',
  )
  assert.equal(
    formatScheduleTiming({mode: 'exactDate', date: '2026-10-01'}),
    '1 October 2026',
  )
  assert.equal(
    formatScheduleTiming({mode: 'custom', customText: '  Late 2026  '}),
    'Late 2026',
  )
})

test('validates real calendar dates', () => {
  assert.equal(isValidScheduleDate('2028-02-29'), true)
  assert.equal(isValidScheduleDate('2026-02-29'), false)
  assert.equal(isValidScheduleDate('2026-13-01'), false)
  assert.equal(isValidScheduleDate('October 2026'), false)
})

test('derives the four Important dates from one Volume schedule', () => {
  const dates = importantDatesFromSchedule('01', {
    submissionsOpen: {mode: 'soon'},
    submissionDeadline: {mode: 'tbd'},
    selectedPhotographersContacted: {mode: 'monthYear', month: 9, year: 2026},
    publication: {mode: 'monthYear', month: 10, year: 2026},
  })

  assert.deepEqual(dates, [
    {label: 'Submissions open', value: 'Soon'},
    {label: 'Submission deadline', value: 'TBD'},
    {label: 'Selected photographers contacted', value: 'September 2026'},
    {label: 'Volume 01 publication', value: 'October 2026'},
  ])
})

test('generates publication FAQ answers', () => {
  assert.equal(answerText({mode: 'soon'}), 'Publication is coming soon.')
  assert.equal(
    answerText({mode: 'tbd'}),
    'The publication date is still to be announced.',
  )
  assert.equal(
    answerText({mode: 'monthYear', month: 10, year: 2026}),
    'Planned for October 2026.',
  )
  assert.equal(
    answerText({mode: 'exactDate', date: '2026-10-01'}, 'Expected'),
    'Expected 1 October 2026.',
  )
})

test('only exposes an exact date to publication metadata', () => {
  assert.equal(
    exactPublicationDate({mode: 'monthYear', month: 10, year: 2026}),
    undefined,
  )
  assert.equal(
    exactPublicationDate({mode: 'exactDate', date: '2026-10-01'}),
    '2026-10-01',
  )
})
