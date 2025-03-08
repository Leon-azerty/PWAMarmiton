import { SearchIcon } from 'lucide-react'

interface ISearchProps {
  search: string
  setSearch: (search: string) => void
}

export default function Search(props: ISearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
        size={18}
      />
      <input
        type="text"
        placeholder="Search recipe with title or ingredients..."
        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />
    </div>
  )
}
