import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CameraScannerProps {
  onScan: (code: string) => void;
  isScanning: boolean;
}

const CameraScanner = ({ onScan, isScanning }: CameraScannerProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera on mobile
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('arrière')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('Impossible d\'accéder aux caméras');
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) {
      setError('Aucune caméra disponible');
      return;
    }

    try {
      setError(null);
      scannerRef.current = new Html5Qrcode('qr-reader');
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          // Optionally stop after successful scan
          // stopScanner();
        },
        () => {
          // Ignore scanning errors (no QR found)
        }
      );
      
      setCameraActive(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Impossible de démarrer la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setCameraActive(false);
  };

  const switchCamera = () => {
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].id);
    
    if (cameraActive) {
      stopScanner().then(() => {
        setTimeout(() => startScanner(), 100);
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scanner avec la caméra
          </span>
          {cameras.length > 1 && cameraActive && (
            <Button variant="ghost" size="sm" onClick={switchCamera}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          id="qr-reader" 
          ref={containerRef}
          className="w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted"
          style={{ display: cameraActive ? 'block' : 'none' }}
        />
        
        {!cameraActive && (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg">
            <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Cliquez sur le bouton ci-dessous pour activer la caméra
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!cameraActive ? (
            <Button 
              className="w-full" 
              onClick={startScanner}
              disabled={isScanning || cameras.length === 0}
            >
              <Camera className="h-4 w-4 mr-2" />
              Activer la caméra
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={stopScanner}
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Arrêter la caméra
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Placez le QR code devant la caméra pour le scanner automatiquement
        </p>
      </CardContent>
    </Card>
  );
};

export default CameraScanner;