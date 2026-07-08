// Storage adapter - abstract layer for easy migration to Cloudflare R2/D1
// Currently uses localStorage, can be swapped to R2+D1 without rewriting app code

export interface StorageAdapter {
  // Lectures
  getLectures(): Promise<any[]>
  saveLectures(lectures: any[]): Promise<void>
  getLecture(id: number): Promise<any | null>
  addLecture(lecture: any): Promise<void>
  updateLecture(id: number, data: Partial<any>): Promise<void>
  deleteLecture(id: number): Promise<void>

  // Scholars
  getScholars(): Promise<any[]>
  saveScholars(scholars: any[]): Promise<void>
  getScholar(id: string): Promise<any | null>
  addScholar(scholar: any): Promise<void>
  updateScholar(id: string, data: Partial<any>): Promise<void>
  deleteScholar(id: string): Promise<void>

  // Playlists
  getPlaylists(): Promise<any[]>
  savePlaylists(playlists: any[]): Promise<void>
  addPlaylist(playlist: any): Promise<void>
  updatePlaylist(id: string, data: Partial<any>): Promise<void>
  deletePlaylist(id: string): Promise<void>

  // Audio files
  uploadAudio(file: File): Promise<{ url: string; metadata: any }>
  deleteAudio(url: string): Promise<void>

  // Auth
  login(username: string, password: string): Promise<boolean>
  logout(): Promise<void>
  isAuthenticated(): Promise<boolean>
}

// localStorage implementation (current)
class LocalStorageAdapter implements StorageAdapter {
  private getStore<T>(key: string): T[] {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]') as T[]
    } catch {
      return []
    }
  }

  private setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data))
  }

  async getLectures() { return this.getStore<any>('salaf-admin-lectures') }
  async saveLectures(lectures: any[]) { this.setStore('salaf-admin-lectures', lectures) }
  async getLecture(id: number) {
    const lectures = await this.getLectures()
    return lectures.find((l: any) => l.id === id) || null
  }
  async addLecture(lecture: any) {
    const lectures = await this.getLectures()
    lectures.push(lecture)
    await this.saveLectures(lectures)
  }
  async updateLecture(id: number, data: Partial<any>) {
    const lectures = await this.getLectures()
    const idx = lectures.findIndex((l: any) => l.id === id)
    if (idx >= 0) { lectures[idx] = { ...lectures[idx], ...data }; await this.saveLectures(lectures) }
  }
  async deleteLecture(id: number) {
    const lectures = await this.getLectures()
    await this.saveLectures(lectures.filter((l: any) => l.id !== id))
  }

  async getScholars() { return this.getStore<any>('salaf-admin-scholars') }
  async saveScholars(scholars: any[]) { this.setStore('salaf-admin-scholars', scholars) }
  async getScholar(id: string) {
    const scholars = await this.getScholars()
    return scholars.find((s: any) => s.id === id) || null
  }
  async addScholar(scholar: any) {
    const scholars = await this.getScholars()
    scholars.push(scholar)
    await this.saveScholars(scholars)
  }
  async updateScholar(id: string, data: Partial<any>) {
    const scholars = await this.getScholars()
    const idx = scholars.findIndex((s: any) => s.id === id)
    if (idx >= 0) { scholars[idx] = { ...scholars[idx], ...data }; await this.saveScholars(scholars) }
  }
  async deleteScholar(id: string) {
    const scholars = await this.getScholars()
    await this.saveScholars(scholars.filter((s: any) => s.id !== id))
  }

  async getPlaylists() { return this.getStore<any>('salaf-admin-playlists') }
  async savePlaylists(playlists: any[]) { this.setStore('salaf-admin-playlists', playlists) }
  async addPlaylist(playlist: any) {
    const playlists = await this.getPlaylists()
    playlists.push(playlist)
    await this.savePlaylists(playlists)
  }
  async updatePlaylist(id: string, data: Partial<any>) {
    const playlists = await this.getPlaylists()
    const idx = playlists.findIndex((p: any) => p.id === id)
    if (idx >= 0) { playlists[idx] = { ...playlists[idx], ...data }; await this.savePlaylists(playlists) }
  }
  async deletePlaylist(id: string) {
    const playlists = await this.getPlaylists()
    await this.savePlaylists(playlists.filter((p: any) => p.id !== id))
  }

  async uploadAudio(file: File): Promise<{ url: string; metadata: any }> {
    return new Promise((resolve) => {
      resolve({
        url: `/audio/${file.name}`,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }
      })
    })
  }

  async deleteAudio(_url: string) { /* no-op for local */ }

  async login(username: string, password: string): Promise<boolean> {
    // Simple auth - in production, use Cloudflare Workers
    return username === 'admin' && password === 'salaf2024'
  }

  async logout(): Promise<void> {
    localStorage.removeItem('salaf-admin-auth')
  }

  async isAuthenticated(): Promise<boolean> {
    return localStorage.getItem('salaf-admin-auth') === 'true'
  }
}

// Export singleton
export const storage: StorageAdapter = new LocalStorageAdapter()

/*
 * Cloudflare Environment Variables needed:
 *
 * R2_BUCKET_NAME=salaf-audio
 * R2_ACCOUNT_ID=<your-cloudflare-account-id>
 * R2_ACCESS_KEY_ID=<r2-access-key>
 * R2_SECRET_ACCESS_KEY=<r2-secret-key>
 *
 * D1_DATABASE_ID=<your-d1-database-id>
 *
 * ADMIN_USERNAME=admin
 * ADMIN_PASSWORD_HASH=<bcrypt-hash>
 *
 * JWT_SECRET=<random-secret-for-auth>
 */
