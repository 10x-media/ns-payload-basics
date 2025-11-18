import type { Page } from '@/payload-types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type TestimonialsSectionType = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'testimonialsSection' }
>

export function TestimonialsSection({ data }: { data: TestimonialsSectionType }) {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold">{data.title}</h2>
        {data.supportingText && <p className="text-muted-foreground">{data.supportingText}</p>}
      </div>
      {data.testimonials && data.testimonials.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.testimonials.map((testimonial, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardContent className="flex h-full flex-col gap-6 pt-6">
                <p className="text-lg leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(testimonial.authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.authorRole}
                      {testimonial.company ? ` · ${testimonial.company}` : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

function getInitials(name?: string | null) {
  if (!name) return '??'
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return initials.join('') || '??'
}
