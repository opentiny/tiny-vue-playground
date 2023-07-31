const sessionStorageService = {
  setItem(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // 处理错误
      console.error('Error setting item in localStorage:', error)
    }
  },
  getItem(key) {
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      // 处理错误
      console.error('Error getting item from sessionStorage:', error)
      return null
    }
  },
  removeItem(key) {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      // 处理错误
      console.error('Error removing item from sessionStorage:', error)
    }
  }
}

export default sessionStorageService
