import API from "./axios";

class BaseApiManager {
  async get(url, params = {}) {
    try {
      const response = await API.get(url, { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: error.message,
        }
      );
    }
  }

  async post(url, data = {}) {
    try {
      const response = await API.post(url, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: error.message,
        }
      );
    }
  }

  async put(url, data = {}) {
    try {
      const response = await API.put(url, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: error.message,
        }
      );
    }
  }

  async patch(url, data = {}) {
    try {
      const response = await API.patch(url, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: error.message,
        }
      );
    }
  }

  async delete(url) {
    try {
      const response = await API.delete(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: error.message,
        }
      );
    }
  }
}

export default new BaseApiManager();