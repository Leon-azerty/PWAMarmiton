import { Input } from '@/ui/input'
import { SearchIcon } from 'lucide-react'

interface ISearchProps {
  search: string
  setSearch: (search: string) => void
}

export default function Search(props: ISearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 transform"
        size={18}
      />
      <Input
        type="text"
        placeholder="Search recipe with title or ingredients..."
        className="w-full rounded-lg border py-2 pl-10 pr-4 shadow-sm outline-none"
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
    </div>
  )
}
