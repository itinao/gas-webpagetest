import WebPagetest = require('../WebPagetest')
import * as fs from 'fs'
import * as path from 'path'

describe('WebPagetest', () => {
  describe('#generateRunTestURL', () => {
    it('should return test url when it has not options', () => {
      const webPagetest = new WebPagetest('key')
      const url = webPagetest.generateRunTestURL('https://example.com')
      expect(url).toMatchInlineSnapshot(
        `"https://www.webpagetest.org/runtest.php?url=https%3A%2F%2Fexample.com&location=ec2-ap-northeast-1.3GFast&runs=1&fvonly=1&video=1&f=JSON&noopt=1&k=key&mobile=1&mobileDevice=Pixel&lighthouse=1"`
      )
    })
    it('should return test url when it has options', () => {
      const webPagetest = new WebPagetest('key')
      const url = webPagetest.generateRunTestURL('https://example.com', {
        location: 'ec2-ap-northeast-1:Chrome',
        runs: 1,
        fvonly: 0,
        video: 0,
        mobile: 0,
        format: 'JSON',
        noOptimization: 0,
        mobileDevice: 'iPhone5c',
        lighthouse: 0,
      })
      expect(url).toMatchInlineSnapshot(
        `"https://www.webpagetest.org/runtest.php?url=https%3A%2F%2Fexample.com&location=ec2-ap-northeast-1%3AChrome&runs=1&fvonly=0&video=0&f=JSON&noopt=0&k=key&mobile=0&mobileDevice=iPhone5c&lighthouse=0"`
      )
    })
    it('should return test url that include script when it has script', () => {
      const webPagetest = new WebPagetest('key')
      const url = webPagetest.generateRunTestURL('https://example.com', {
        script: `logData    0

// put any urls you want to navigate
navigate    www.aol.com
navigate    news.aol.com

logData    1

// this step will get recorded
navigate    news.aol.com/world
`,
      })
      expect(url).toMatchInlineSnapshot(
        `"https://www.webpagetest.org/runtest.php?url=https%3A%2F%2Fexample.com&location=ec2-ap-northeast-1.3GFast&runs=1&fvonly=1&video=1&f=JSON&noopt=1&k=key&mobile=1&mobileDevice=Pixel&lighthouse=1&script=logData%20%20%20%200%0A%0A%2F%2F%20put%20any%20urls%20you%20want%20to%20navigate%0Anavigate%20%20%20%20www.aol.com%0Anavigate%20%20%20%20news.aol.com%0A%0AlogData%20%20%20%201%0A%0A%2F%2F%20this%20step%20will%20get%20recorded%0Anavigate%20%20%20%20news.aol.com%2Fworld%0A"`
      )
    })
  })
  describe('generateTestResult', () => {
    beforeAll(() => {
      // stub https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate-timezone-format
      ;(global as any).Utilities = {
        formatDate: (date: Date, timeZone: string, format: string) => {
          return `${date.toISOString()}, ${timeZone}, ${format}`
        },
      }
    })
    afterAll(() => {
      delete (global as any).Utilities
    })
    it('should return results', () => {
      const webPagetest = new WebPagetest('key')
      const snapshotTargets = [
        path.join(__dirname, 'fixtures/WebPagetest-response-google.com.json'),
        path.join(__dirname, 'fixtures/WebPagetest-response-youtube.com.json'),
      ]
      snapshotTargets.forEach(filePath => {
        const response = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        const names = webPagetest.generateTestResultNames()
        const result = webPagetest.convertWebPageResponseToResult(response)
        const values = webPagetest.generateTestResultValues(result)
        const actualResults = names.map((name, index) => {
          return {
            name,
            value: values[index],
          }
        })
        expect(actualResults).toMatchSnapshot(path.basename(filePath, '.json'))
      })
    })
  })
})
