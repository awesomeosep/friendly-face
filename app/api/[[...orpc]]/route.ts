import { RPCHandler } from '@orpc/server/fetch'
import { router } from '@/server/api/orpc'
import { createORPCContext } from '@/server/context'
import { NextRequest } from 'next/server'

const handler = new RPCHandler(router)

async function handleRequest(request: NextRequest) {
  try {
    const result = await handler.handle(request, {
      prefix: '/api',
      context: await createORPCContext(request),
    })

    if (result.matched) {
      return result.response
    }

    return new Response('Sorry, Not found', { status: 404 })
  } catch (error) {
    console.error('oRPC request failed:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
