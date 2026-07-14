import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface Photo {
  id: number;
  url: string;
  name: string;
}

@Component({
  selector: 'app-index',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {
  img = signal<Photo>({ id: 1, url: '', name: '' });
  private nextId = 1;

  isSelected1x1 = signal(false);
  isSelected2x2 = signal(false);
  isSelectedPassport = signal(false);
  isSelectedWallet = signal(false);
  isSelected4r = signal(false);
  isSelected5r = signal(false);

  isDownloading = signal(false);

  @ViewChild('pageRef') pageRef!: ElementRef<HTMLDivElement>;

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || !files.length) return;

    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.img.set({
        id: this.nextId++,
        url: reader.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  async downloadAsPdf(): Promise<void> {
    if (!this.pageRef?.nativeElement) return;

    this.isDownloading.set(true);
    try {
      const element = this.pageRef.nativeElement;

      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: Math.max(3, window.devicePixelRatio * 2),
        useCORS: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
      } as any);

      const imgData = canvas.toDataURL('image/png');

      const widthIn = element.offsetWidth / 96;
      const heightIn = element.offsetHeight / 96;

      const pdf = new jsPDF({
        orientation: widthIn > heightIn ? 'landscape' : 'portrait',
        unit: 'in',
        format: [widthIn, heightIn],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, widthIn, heightIn, undefined, 'NONE');
      pdf.save('photo-layout.pdf');
    } finally {
      this.isDownloading.set(false);
    }
  }
}
