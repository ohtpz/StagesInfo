import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "accepted":
            return <Badge className="bg-green-100 text-green-700 border-green-200">Acceptée</Badge>;
        case "pending":
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200">En attente</Badge>;
        case "rejected":
            return <Badge className="bg-red-100 text-red-700 border-red-200">Refusée</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}
