#!/usr/bin/env node
/**
 * Fix "unable to find package.json for react-leaflet" Storybook warning.
 * react-leaflet's exports field doesn't expose package.json; this adds it.
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgPath = path.join(__dirname, '../node_modules/react-leaflet/package.json')

try {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  if (!pkg.exports['./package.json']) {
    pkg.exports['./package.json'] = './package.json'
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log('Patched react-leaflet package.json exports')
  }
} catch (err) {
  console.warn('Could not patch react-leaflet:', err.message)
}
