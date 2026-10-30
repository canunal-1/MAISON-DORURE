import Image from "next/image";
import type { Photo } from "@/content/site";

type Format = "large" | "portrait" | "paysage";

/**
 * Une photo recadrée au format voulu. Sans photo (`null`), ne rend strictement rien :
 * jamais de cadre vide ni d'image de remplacement.
 */
export default function Photographie({
  photo,
  format,
  sizes,
  className = "",
}: {
  photo: Photo | null | undefined;
  format: Format;
  /** Largeur d'affichage selon l'écran, pour que le navigateur charge la bonne taille. */
  sizes: string;
  className?: string;
}) {
  if (!photo) return null;

  return (
    <figure className={`photo photo-${format} ${className}`.trim()}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        style={photo.cadrage ? { objectPosition: photo.cadrage } : undefined}
      />
    </figure>
  );
}
