

import com.twilio.twiml.Dial;
import com.twilio.twiml.Number;
import com.twilio.twiml.Record;
import com.twilio.twiml.Say;
import com.twilio.twiml.TwiMLException;
import com.twilio.twiml.VoiceResponse;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class TwilioHandleKeyServlet extends HttpServlet {

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String digits = request.getParameter("Digits");
        VoiceResponse twiml;
        if (digits != null && digits.equals("1")) {
            // Connect 310 555 1212 to the incoming caller.
            Number number = new Number.Builder("+13105551212").build();
            Dial dial = new Dial.Builder().number(number).build();
            // If the above dial failed, say an error message.
            Say say = new Say.Builder("The call failed, or the remote party hung up. Goodbye.").build();

            twiml = new VoiceResponse.Builder().dial(dial).say(say).build();
        } else if (digits != null && digits.equals("2")) {
            Say pleaseLeaveMessage = new Say.Builder("Record your monkey howl after the tone.").build();
            // Record the caller's voice.
            Record record = new Record.Builder()
                    .maxLength(30)
                    .action("/handle-recording") // You may need to change this to point to the location of your servlet
                    .build();
            twiml = new VoiceResponse.Builder().say(pleaseLeaveMessage).record(record).build();
        } else {
            response.sendRedirect("/twiml");
            return;
        }

        response.setContentType("application/xml");
        try {
            response.getWriter().print(twiml.toXml());
        } catch (TwiMLException e) {
            e.printStackTrace();
        }
    }
}