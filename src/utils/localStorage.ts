const LocalStorageService = {
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // 处理错误
      console.error('Error setting item in localStorage:', error)
    }
  },
  getItem(key) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      // 处理错误
      console.error('Error getting item from localStorage:', error)
      return null
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      // 处理错误
      console.error('Error removing item from localStorage:', error)
    }
  }
}

export default LocalStorageService
