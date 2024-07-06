import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge'

type Param = {
  params: {
    owner: string,
    repo: string,
    path: Array<string>
  }
}
type GithubResp = {
  content: string
}

export async function GET(req: NextRequest, params: Param) {

  const password = getRequestContext().env.PASSWORD
  const githubToken = getRequestContext().env.GITHUB_TOKEN
  const searchParams = req.nextUrl.searchParams
  const reqPassword = searchParams.get('password')
  if (reqPassword !== password) {
    return new Response('Unauthorized', { status: 401 })
  }


  const ref = searchParams.get('ref')
  let githubUrl = `https://api.github.com/repos/${params.params.owner}/${params.params.repo}/contents/${params.params.path.join('/')}`
  if (ref) {
    githubUrl += `?ref=${ref}`
  }

  const response: Response = await fetch(githubUrl, {
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }

  })
  if (response.status !== 200) {
    return new Response(response.body, { status: response.status })
  }
  return new Response(await response.text())
}