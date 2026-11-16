import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  DEFAULT_APP_LOGO,
  resetAppLogo,
  saveAppLogo,
  subscribeToAppLogo,
} from '../services/dairySyncCloud';

const MAX_SOURCE_SIZE = 5 * 1024 * 1024;
const MAX_STORED_SIZE = 600_000;
const LOGO_SIZE = 512;

export async function encodeAppLogo(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a PNG, JPEG, or WebP image.');
  }
  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error('The image must be smaller than 5 MB.');
  }

  const image = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = LOGO_SIZE;
    canvas.height = LOGO_SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The selected image could not be processed by this browser.');

    const scale = Math.min(LOGO_SIZE / image.width, LOGO_SIZE / image.height);
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);
    context.drawImage(image, (LOGO_SIZE - width) / 2, (LOGO_SIZE - height) / 2, width, height);

    const logoDataUrl = canvas.toDataURL('image/webp', 0.82);
    if (logoDataUrl.length > MAX_STORED_SIZE) {
      throw new Error('The optimized image is too large to save. Choose a simpler image.');
    }
    return logoDataUrl;
  } finally {
    image.close();
  }
}

export function useAppBranding() {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_APP_LOGO);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let stopLogoSubscription = () => {};
    const stopAuthSubscription = onAuthStateChanged(
      auth,
      user => {
        stopLogoSubscription();
        if (!user) {
          setLogoUrl(DEFAULT_APP_LOGO);
          setError('');
          return;
        }

        setError('');
        stopLogoSubscription = subscribeToAppLogo(
          updatedLogoUrl => {
            setLogoUrl(updatedLogoUrl);
            setError('');
          },
          subscriptionError => {
            setError(subscriptionError instanceof Error
              ? subscriptionError.message
              : 'The shared app logo could not be loaded.');
          }
        );
      },
      authError => setError(authError.message)
    );

    return () => {
      stopLogoSubscription();
      stopAuthSubscription();
    };
  }, []);

  useEffect(() => {
    for (const selector of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
      const link = document.querySelector<HTMLLinkElement>(selector);
      if (link) link.href = logoUrl;
    }
  }, [logoUrl]);

  const updateLogo = async (logoDataUrl: string) => {
    setIsSaving(true);
    setError('');
    try {
      await saveAppLogo(logoDataUrl);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The shared app logo could not be saved.');
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  };

  const restoreDefaultLogo = async () => {
    setIsSaving(true);
    setError('');
    try {
      await resetAppLogo();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'The default app logo could not be restored.');
      throw resetError;
    } finally {
      setIsSaving(false);
    }
  };

  return { logoUrl, error, isSaving, updateLogo, restoreDefaultLogo };
}
