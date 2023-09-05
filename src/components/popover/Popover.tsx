import { ElementType, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingPortal, useFloating, arrow, shift, offset, Placement } from '@floating-ui/react-dom-interactions'
interface Props {
  children: React.ReactNode
  renderPopover: React.ReactNode
  className?: string
  as?: ElementType
  initialOpen?: boolean
  placement?: Placement
}
// cái initialOpen chỉ để xem lúc đầu nó mở hay nó đóng
const Popover = ({ children, className, renderPopover, as: Element = 'div', initialOpen, placement }: Props) => {
  const [open, setOpen] = useState(initialOpen || false)
  const arrowRef = useRef<HTMLElement>(null)
  const { x, y, reference, floating, strategy, middlewareData } = useFloating({
    middleware: [offset(10), shift(), arrow({ element: arrowRef })],
    placement: placement
  })
  const showPopHover = () => {
    setOpen(true)
  }
  const hidePopHover = () => {
    setOpen(false)
  }
  const id = useId()
  return (
    <Element className={className} ref={reference} onMouseEnter={showPopHover} onMouseLeave={hidePopHover}>
      {children}
      <FloatingPortal id={id}>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={floating}
              style={{
                color: 'white',
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
                // vị trí phóng animation ra
                transformOrigin: `${middlewareData.arrow?.x}px top`
              }}
              initial={{ opacity: 0, transform: 'scale(0)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              exit={{ opacity: 0, transform: 'scale(0)' }}
              transition={{ duration: 0.2 }}
            >
              {/* cái mũi tên chỉ lên trên */}
              <span
                ref={arrowRef}
                style={{
                  left: middlewareData.arrow?.x,
                  top: middlewareData.arrow?.y
                }}
                className='z-10  border-x-transparent border-t-transparent border-b-white -translate-y-[99%] border-[11px] absolute '
              ></span>
              {renderPopover}
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </Element>
  )
}

export default Popover
