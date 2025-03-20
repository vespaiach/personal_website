import { format } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMMM dd, yyyy')
}

export function sortDateDesc<T extends { date: string }>(posts: T[]): T[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })
}
