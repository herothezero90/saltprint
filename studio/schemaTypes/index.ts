import type {SchemaTypeDefinition} from 'sanity'
import {richText} from './richText'
import {siteSettings} from './siteSettings'
import {volume} from './volume'

export const schemaTypes: SchemaTypeDefinition[] = [richText, volume, siteSettings]
