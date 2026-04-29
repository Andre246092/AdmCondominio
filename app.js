const Auth = {

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },

  async login() {
    const input = document.getElementById("passwordInput").value;
    const savedHash = localStorage.getItem("condo_password");

    if (!savedHash) {
      // Primeira vez → cria senha
      const hash = await this.hashPassword(input);
      localStorage.setItem("condo_password", hash);
      alert("Senha criada com sucesso!");
      this.enterSystem();
      return;
    }

    const hash = await this.hashPassword(input);

    if (hash === savedHash) {
      this.enterSystem();
    } else {
      document.getElementById("loginMessage").innerText = "Senha incorreta.";
    }
  },

  enterSystem() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("systemScreen").style.display = "block";
  UI.loadDashboard();
},

  async changePassword() {
    const current = document.getElementById("currentPassword").value;
    const newPass = document.getElementById("newPassword").value;

    const savedHash = localStorage.getItem("condo_password");
    const currentHash = await this.hashPassword(current);

    if (currentHash !== savedHash) {
      document.getElementById("configMessage").innerText = "Senha atual incorreta.";
      return;
    }

    const newHash = await this.hashPassword(newPass);
    localStorage.setItem("condo_password", newHash);

    document.getElementById("configMessage").innerText = "Senha alterada com sucesso!";
  }

};