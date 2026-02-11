import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentsApi } from "@/services/api";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  amount: number;
  onSuccess: () => void;
}

const operators = [
  { id: 'mpesa', name: 'M-Pesa', pattern: /^(081|082|083)[0-9]{7}$/, placeholder: '081XXXXXXX', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/M-Pesa_logo.svg/512px-M-Pesa_logo.svg.png' },
  { id: 'orange', name: 'Orange Money', pattern: /^(084|085|089)[0-9]{7}$/, placeholder: '084XXXXXXX', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/512px-Orange_logo.svg.png' },
  { id: 'airtel', name: 'Airtel Money', pattern: /^(097|098|099)[0-9]{7}$/, placeholder: '097XXXXXXX', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Airtel_logo.svg/512px-Airtel_logo.svg.png' },
];

export function PaymentDialog({ isOpen, onClose, plan, amount, onSuccess }: PaymentDialogProps) {
  const [step, setStep] = useState<'select' | 'details' | 'confirm' | 'success'>('select');
  const [operator, setOperator] = useState(operators[0].id);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleNext = async () => {
    if (step === 'select') {
      setIsProcessing(true);
      try {
        const res = await paymentsApi.initiate({ amount, plan });
        if (res.success) {
          setPaymentId(res.data.paymentId);
          setStep('details');
          setPhoneError("");
        } else {
          toast({ title: "Erreur", description: "Impossible d'initialiser le paiement", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Erreur", description: "Erreur de connexion", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    }
    else if (step === 'details') {
      const selectedOp = operators.find(o => o.id === operator);
      if (!phoneNumber.trim()) {
        setPhoneError("Le numéro est requis");
        return;
      }
      if (selectedOp && !selectedOp.pattern.test(phoneNumber.replace(/\s/g, ''))) {
        setPhoneError(`Numéro ${selectedOp.name} invalide (format: ${selectedOp.placeholder})`);
        return;
      }
      setPhoneError("");
      setStep('confirm');
    }
  };

  const handlePayment = async () => {
    if (!paymentId) return;
    setIsProcessing(true);
    
    try {
      // Simulation d'appel API externe
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Valider réellement en DB via notre endpoint de simulation
      const res = await paymentsApi.simulateSuccess(paymentId);
      
      if (res.success) {
        setIsProcessing(false);
        setStep('success');
        
        setTimeout(() => {
            onSuccess();
            onClose();
            setStep('select');
            setPaymentId(null);
            setPhoneNumber("");
        }, 3000);
      } else {
        toast({ title: "Erreur", description: "La validation a échoué", variant: "destructive" });
        setIsProcessing(false);
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Paiement Mobile Money
          </DialogTitle>
          <DialogDescription>
            Souscription au plan <span className="font-bold text-foreground capitalize">{plan}</span> • {amount}€
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'select' && (
            <div className="space-y-4">
              <Label>Choisissez votre opérateur</Label>
              <RadioGroup value={operator} onValueChange={setOperator} className="grid grid-cols-1 gap-3">
                {operators.map((op) => (
                  <label
                    key={op.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                      operator === op.id ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center p-2 bg-white shadow-sm")}>
                         <img src={op.logo} alt={op.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="font-semibold">{op.name}</span>
                    </div>
                    <RadioGroupItem value={op.id} id={op.id} className="sr-only" />
                    {operator === op.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                <img src={operators.find(o => o.id === operator)?.logo} className="w-6 h-6 object-contain" />
                <span className="text-sm font-medium">Paiement via {operators.find(o => o.id === operator)?.name}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Votre numéro de téléphone</Label>
                <Input 
                  id="phone" 
                  placeholder={`Ex: ${operators.find(o => o.id === operator)?.placeholder}`} 
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  className={cn("text-lg py-6", phoneError && "border-destructive focus-visible:ring-destructive")}
                />
                {phoneError && <p className="text-sm text-destructive font-medium">{phoneError}</p>}
                <p className="text-xs text-muted-foreground italic">
                  Un message de confirmation sera envoyé sur ce numéro.
                </p>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="animate-pulse">
                   <Smartphone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-lg font-medium">Confirmez le paiement sur votre mobile</p>
              <p className="text-sm text-muted-foreground">
                Tapez votre code secret sur votre téléphone pour valider la transaction de {amount}€ vers le numéro HK Distribution.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-700">Paiement Réussi !</h3>
              <p className="text-muted-foreground">
                Votre abonnement a été mis à jour avec succès. Redirection en cours...
              </p>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {step !== 'confirm' ? (
               <>
                 <Button variant="ghost" onClick={step === 'select' ? onClose : () => setStep('select')} disabled={isProcessing}>
                   {step === 'select' ? 'Annuler' : 'Retour'}
                 </Button>
                 <Button onClick={handleNext} className="flex-1" disabled={isProcessing}>
                   {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continuer'}
                 </Button>
               </>
            ) : (
               <Button onClick={handlePayment} className="w-full h-12 text-lg" disabled={isProcessing}>
                 {isProcessing ? (
                   <>
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                     Traitement...
                   </>
                 ) : (
                   "J'ai validé le paiement"
                 )}
               </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
