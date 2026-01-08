import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  isSpeaking = signal(false);
  isPaused = signal(false);
  rate = signal(1.0);
  
  private synth = window.speechSynthesis;
  private queue: string[] = [];
  private currentIndex = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private textChunkLimit = 200; // Safe limit for browser TTS

  constructor() {
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.getPortugueseVoice();
    }
  }

  speak(text: string) {
    this.cancel(); // Reset everything
    
    if (!text) return;

    // Split text into manageable chunks (by punctuation/newline) to avoid browser timeout on long texts
    this.queue = this.chunkText(text);
    this.currentIndex = 0;
    
    this.isSpeaking.set(true);
    this.isPaused.set(false);
    
    this.playNextChunk();
  }

  private playNextChunk() {
    if (this.currentIndex >= this.queue.length) {
      this.isSpeaking.set(false);
      this.isPaused.set(false);
      return;
    }

    const chunk = this.queue[this.currentIndex];
    if (!chunk.trim()) {
      this.currentIndex++;
      this.playNextChunk();
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(chunk);
    
    const voice = this.getPortugueseVoice();
    if (voice) {
      this.currentUtterance.voice = voice;
    }
    
    this.currentUtterance.lang = 'pt-BR';
    this.currentUtterance.rate = this.rate();
    this.currentUtterance.pitch = 1.0;

    this.currentUtterance.onend = () => {
      this.currentIndex++;
      if (this.isSpeaking() && !this.isPaused()) {
        this.playNextChunk();
      }
    };

    this.currentUtterance.onerror = (e) => {
      console.error('TTS Error', e);
      // Try to skip to next on error
      this.currentIndex++;
      this.playNextChunk();
    };

    this.synth.speak(this.currentUtterance);
  }

  cycleRate() {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const current = this.rate();
    const next = rates[(rates.indexOf(current) + 1) % rates.length] || 1.0;
    this.rate.set(next);
    
    // If speaking, we need to restart the current chunk with new rate
    if (this.isSpeaking() && !this.isPaused()) {
       this.synth.cancel();
       // Re-trigger current chunk
       this.playNextChunk(); 
    }
  }

  skip(direction: 'next' | 'prev') {
    // Stop current utterance immediately, but don't clear queue (like cancel() does)
    this.synth.cancel();
    
    if (direction === 'next') {
      if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++;
      }
    } else {
      if (this.currentIndex > 0) {
        // Go back 1 chunk (often this replays the current one if just started, but logically it's prev)
        // For better UX, if we want "Rewind", we go back.
        this.currentIndex--;
      }
    }

    // Resume playing at new index if we were active
    if (this.isSpeaking()) {
      this.isPaused.set(false); // Ensure we aren't paused
      this.playNextChunk();
    }
  }

  togglePause() {
    if (this.synth.paused) {
      this.synth.resume();
      this.isPaused.set(false);
    } else if (this.synth.speaking) {
      this.synth.pause();
      this.isPaused.set(true);
    }
  }

  cancel() {
    this.synth.cancel();
    this.queue = [];
    this.currentIndex = 0;
    this.isSpeaking.set(false);
    this.isPaused.set(false);
  }

  private chunkText(text: string): string[] {
    // Regex matches sentence boundaries (.!?) or newlines
    // We want to keep the delimiter
    const chunks = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    return chunks;
  }

  private getPortugueseVoice(): SpeechSynthesisVoice | null {
    const voices = this.synth.getVoices();
    // Prioritize natural voices
    return voices.find(v => v.lang.includes('pt-BR') && (v.name.includes('Google') || v.name.includes('Luciana'))) ||
           voices.find(v => v.lang.includes('pt-BR')) ||
           voices.find(v => v.lang.includes('pt')) ||
           null;
  }
}