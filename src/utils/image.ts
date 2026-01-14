/**
 * Сжимает изображение перед отправкой на сервер.
 * @param base64 Исходное изображение в base64
 * @param maxWidth Максимальная ширина (по умолчанию 800px)
 * @param quality Качество сжатия (0.0 - 1.0)
 * @returns Сжатое изображение в base64
 */
export async function compressImage(
	base64: string,
	maxWidth = 800,
	quality = 0.7
): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.src = base64
		img.onload = () => {
			const canvas = document.createElement('canvas')
			let width = img.width
			let height = img.height

			// Расчет пропорций
			if (width > maxWidth) {
				height = (height * maxWidth) / width
				width = maxWidth
			}

			canvas.width = width
			canvas.height = height

			const ctx = canvas.getContext('2d')
			if (!ctx) return reject(new Error('Failed to get canvas context'))

			ctx.drawImage(img, 0, 0, width, height)
			resolve(canvas.toDataURL('image/jpeg', quality))
		}
		img.onerror = reject
	})
}
