import ActionOption from './ActionOption'

export type ActionOptionItem = {
  title: string
  description: string
  onClick?: () => void
}

type ActionOptionListProps = {
  items: ActionOptionItem[]
}

function ActionOptionList({ items }: ActionOptionListProps) {
  return (
    <>
      {items.map((item) => (
        <ActionOption key={item.title} {...item} />
      ))}
    </>
  )
}

export default ActionOptionList
