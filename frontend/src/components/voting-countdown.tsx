import { useEffect, useState } from 'react'
import { api } from '@/libs/api'
import { Card } from '@/components/ui/card'
import { AlertCircle, Clock } from 'lucide-react'

export function VotingCountdown() {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [votingPeriod, setVotingPeriod] = useState<{
        isSet: boolean;
        isActive: boolean;
        hasEnded: boolean;
        startTime: number;
        endTime: number;
    } | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVotingPeriod = async () => {
            try {
                const data = await api.getVotingPeriod()
                setVotingPeriod(data)
            } catch (err) {
                setError('Gagal mengambil periode pemilihan')
                console.error('Error fetching voting period:', err)
            }
        }

        fetchVotingPeriod()
        const interval = setInterval(fetchVotingPeriod, 60000) // Refresh every minute

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!votingPeriod?.isActive) return

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000)
            const difference = votingPeriod.endTime - now

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
            }

            return {
                days: Math.floor(difference / (60 * 60 * 24)),
                hours: Math.floor((difference / (60 * 60)) % 24),
                minutes: Math.floor((difference / 60) % 60),
                seconds: Math.floor(difference % 60)
            }
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [votingPeriod])

    if (error) {
        return (
            <Card className="p-4 mb-6 bg-destructive/10">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            </Card>
        )
    }

    if (!votingPeriod) {
        return null
    }

    if (!votingPeriod.isSet) {
        return (
            <Card className="p-4 mb-6 bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <p>Periode pemilihan belum ditentukan</p>
                </div>
            </Card>
        )
    }

    if (votingPeriod.hasEnded) {
        return (
            <Card className="p-4 mb-6 bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <p>Periode pemilihan telah berakhir</p>
                </div>
            </Card>
        )
    }

    if (!votingPeriod.isActive) {
        const startDate = new Date(votingPeriod.startTime * 1000).toLocaleString()
        return (
            <Card className="p-4 mb-6 bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <p>Pemilihan akan dimulai pada {startDate}</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4 mb-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-semibold">Waktu Tersisa</h3>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold">{timeLeft.days}</div>
                        <div className="text-sm text-muted-foreground">Hari</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{timeLeft.hours}</div>
                        <div className="text-sm text-muted-foreground">Jam</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                        <div className="text-sm text-muted-foreground">Menit</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                        <div className="text-sm text-muted-foreground">Detik</div>
                    </div>
                </div>
            </div>
        </Card>
    )
} 