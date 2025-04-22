import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CandidateFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  isSubmitting: boolean
  triggerButton: React.ReactNode
}

export function CandidateFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  triggerButton
}: CandidateFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Tambah Kandidat Baru</DialogTitle>
          <DialogDescription>
            Isi formulir berikut untuk menambahkan kandidat baru ke dalam sistem pemilihan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nama</label>
            <Input 
              id="name" 
              name="name" 
              required 
              autoComplete="off"
              aria-label="Nama Kandidat"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">Gambar</label>
            <Input 
              id="image" 
              name="image" 
              type="file" 
              accept="image/*"
              aria-label="Gambar Kandidat"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Tambah Kandidat'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 