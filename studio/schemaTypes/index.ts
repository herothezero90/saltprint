import type {SchemaTypeDefinition} from 'sanity'
import {richText} from './richText'
import {scheduleTiming} from './scheduleTiming'
import {siteSettings} from './siteSettings'
import {volume} from './volume'

export const schemaTypes: SchemaTypeDefinition[] = [
  richText,
  scheduleTiming,
  volume,
  siteSettings,
]
