import type { Page } from '@/payload-types'
import { HeroSection } from './blocks/HeroSection'
import { MarketplaceShowcase } from './blocks/MarketplaceShowcase'
import { TestimonialsSection } from './blocks/TestimonialsSection'

type BlocksType = NonNullable<Page['layout']>

export function RenderBlocks({ blocks }: { blocks?: BlocksType }) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <>
      {blocks.map((block, index) => {
        const { blockType } = block

        switch (blockType) {
          case 'heroSection':
            return <HeroSection key={block.id || index} data={block} />
          case 'marketplaceShowcase':
            return <MarketplaceShowcase key={block.id || index} data={block} />
          case 'testimonialsSection':
            return <TestimonialsSection key={block.id || index} data={block} />
          default:
            return null
        }
      })}
    </>
  )
}
